import { VoicePeer } from './peer.js';
import { io } from 'socket.io-client';
import { voiceService, voiceSocketUrl } from '@/service/voice.service';

export class VoiceSession {
  constructor(room, token, callbacks) {
    this.room = room;
    this.token = token;
    this.abort = new AbortController();
    this.callbacks = callbacks;
    this.closed = false;
    this.ready = false;
    this.peers = new Map();
    this.departed = new Set();
    this.buffer = [];
    this.outgoing = Promise.resolve();
    this.socket = io(voiceSocketUrl(), {
      transports: ['websocket'],
      auth: { token },
      autoConnect: false,
      reconnection: false,
    });
    this.socket.on('disconnect', (reason) =>
      this.close(
        reason === 'io server disconnect'
          ? 'Disconnected. Enter a fresh access token.'
          : 'Reconnecting...',
        reason !== 'io server disconnect',
      ),
    );
    this.socket.on('voice:removed', () => this.close('Room access revoked.'));
    for (const name of [
      'peer-joined',
      'peer-left',
      'media-updated',
      'offer',
      'answer',
      'ice',
    ]) {
      this.socket.on(`voice:${name}`, (data) => {
        if (this.closed) return;
        if (!this.ready) {
          if (this.buffer.length >= 256) {
            this.close('Message queue full. Rejoin.');
            return;
          }
          this.buffer.push([name, data]);
        } else this.handle(name, data);
      });
    }
  }

  // Server exceptions are not correlated with requests. Keep one outstanding RPC.
  send(event, payload, allowed = () => true) {
    const operation = this.outgoing.then(
      () =>
        new Promise((resolve, reject) => {
          if (this.closed || !this.socket.connected || !allowed()) {
            reject(new Error('Connection closed.'));
            return;
          }
          let settled = false;
          const done = (error, result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            this.socket.off('exception', exception);
            this.cancelRequest = null;
            if (error) reject(error);
            else resolve(result);
          };
          const exception = (data) =>
            done(new Error(data.message || 'Voice request rejected.'));
          const timer = setTimeout(() => {
            done(new Error('Server did not respond. Rejoin.'));
            this.close('Server did not respond. Rejoin.');
          }, 8000);
          this.cancelRequest = () => done(new Error('Connection closed.'));
          this.socket.once('exception', exception);
          this.socket.emit(event, payload, (result) => done(null, result));
        }),
    );
    this.outgoing = operation.catch(() => {});
    return operation;
  }

  async fetchConfiguration() {
    const timer = setTimeout(
      () => this.abort.abort(new Error('Connection timed out.')),
      8000,
    );
    try {
      await voiceService.room(this.room, this.token, this.abort.signal);
      return await voiceService.ice(this.room, this.token, this.abort.signal);
    } finally {
      clearTimeout(timer);
    }
  }

  async enter() {
    if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection)
      throw new Error(
        'Use HTTPS or localhost and a browser supporting WebRTC.',
      );
    const { expiresAt, ...configuration } = await this.fetchConfiguration();
    if (this.closed) return;
    this.configuration = configuration;
    if (expiresAt)
      this.credentialTimer = setTimeout(
        () =>
          this.close(
            'TURN credentials expired. Rejoin with a fresh access token.',
          ),
        Math.max(0, expiresAt * 1000 - Date.now()),
      );
    if (this.closed) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    if (this.closed) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    this.microphone = stream;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = false;
      track.onended = () =>
        this.close(
          'Microphone disconnected. Rejoin to select an available microphone.',
        );
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => finish(new Error('Connection timed out.')),
        8000,
      );
      const connected = () => finish();
      const failed = (error) => finish(error);
      const finish = (error) => {
        clearTimeout(timer);
        this.socket.off('connect', connected);
        this.socket.off('connect_error', failed);
        this.cancelConnect = null;
        if (error) reject(error);
        else resolve();
      };
      this.cancelConnect = () => finish(new Error('Connection cancelled.'));
      this.socket.once('connect', connected);
      this.socket.once('connect_error', failed);
      this.socket.connect();
    });
    const joined = await this.send('voice:join', this.room);
    if (this.closed) return;
    this.ready = true;
    this.callbacks.joined(joined);
    for (const participant of joined.participants) this.addPeer(participant);
    for (const state of joined.mediaStates) this.callbacks.state(state);
    for (const [name, data] of this.buffer.splice(0)) this.handle(name, data);
  }

  addPeer(participant) {
    this.callbacks.participant(participant);
    if (
      participant.peerId === this.socket.id ||
      this.peers.has(participant.peerId)
    )
      return;
    this.departed.delete(participant.peerId);
    this.peers.set(participant.peerId, new VoicePeer(this, participant.peerId));
  }

  handle(name, data) {
    if (this.closed || data.roomId !== `team:${this.room.teamId}`) return;
    if (name === 'peer-joined') this.addPeer(data.participant);
    else if (name === 'peer-left') {
      const id = data.participant.peerId;
      this.departed.add(id);
      this.peers.get(id)?.close();
      this.peers.delete(id);
      this.callbacks.departed(id);
    } else if (name === 'media-updated') this.callbacks.state(data.state);
    else if (!this.departed.has(data.fromPeerId)) {
      if (!this.peers.has(data.fromPeerId))
        this.addPeer({ peerId: data.fromPeerId, userId: data.fromUserId });
      this.peers.get(data.fromPeerId)?.receive(name, data);
    }
  }

  async setMuted(muted) {
    // Stop audio immediately when muting; only enable after the server accepts it.
    if (muted)
      this.microphone.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    const result = await this.send('voice:microphone', { ...this.room, muted });
    if (!this.closed)
      this.microphone.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    return result;
  }

  async startScreen() {
    if (this.screen) return;
    if (!navigator.mediaDevices.getDisplayMedia)
      throw new Error('Screen sharing is not supported by this browser.');
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
    if (this.closed) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    try {
      await this.send('voice:screen-start', this.room);
      if (this.closed) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.screen = stream;
      stream.getVideoTracks()[0].onended = () =>
        this.stopScreen().catch((error) => this.close(error.message));
      this.callbacks.preview(stream);
      for (const peer of this.peers.values()) peer.addScreen(stream);
      if (stream.getVideoTracks()[0].readyState === 'ended')
        await this.stopScreen();
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());
      throw error;
    }
  }

  async stopScreen() {
    if (!this.screen) return;
    this.screen.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    this.screen = null;
    for (const peer of this.peers.values()) peer.removeScreen();
    this.callbacks.preview(null);
    if (!this.closed) await this.send('voice:screen-stop', this.room);
  }

  close(message = 'Disconnected', retry = false) {
    if (this.closed) return;
    this.closed = true;
    this.abort.abort();
    clearTimeout(this.credentialTimer);
    this.token = null;
    this.ready = false;
    this.cancelConnect?.();
    this.cancelRequest?.();
    this.microphone?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    this.screen?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    this.screen = null;
    for (const peer of this.peers.values()) peer.close();
    this.peers.clear();
    this.buffer = [];
    this.socket.disconnect();
    this.socket.auth = {};
    this.socket.removeAllListeners();
    this.callbacks.closed(message, retry);
  }
}

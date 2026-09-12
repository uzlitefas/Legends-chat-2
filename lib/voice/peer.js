// Both sides can add tracks. A stable peer-ID ordering resolves offer collisions.
export class VoicePeer {
  constructor(session, peerId) {
    this.session = session;
    this.id = peerId;
    this.pc = new RTCPeerConnection(session.configuration);
    this.polite = session.socket.id > peerId;
    this.closed = false;
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.pendingIce = [];
    this.incoming = Promise.resolve();
    this.pc.onicecandidate = ({ candidate }) => {
      this.send('voice:ice', { candidate: candidate?.toJSON() ?? null }).catch(
        (error) => this.report(error),
      );
    };
    this.pc.onnegotiationneeded = () => {
      this.incoming = this.incoming
        .then(async () => {
          if (this.closed || this.pc.signalingState !== 'stable') return;
          try {
            this.makingOffer = true;
            await this.pc.setLocalDescription();
            await this.send(`voice:${this.pc.localDescription.type}`, {
              sdp: this.pc.localDescription.sdp,
            });
          } finally {
            this.makingOffer = false;
          }
        })
        .catch((error) => this.report(error));
    };
    this.pc.ontrack = ({ track }) => session.callbacks.track(peerId, track);
    this.restartAttempts = 0;
    this.pc.onconnectionstatechange = () => {
      session.callbacks.connection(peerId, this.pc.connectionState);
      if (this.pc.connectionState === 'failed' && this.restartAttempts++ < 3)
        this.pc.restartIce();
    };
    for (const track of session.microphone.getTracks())
      this.pc.addTrack(track, session.microphone);
    if (session.screen) this.addScreen(session.screen);
  }

  send(event, payload) {
    return this.session.send(
      event,
      { ...this.session.room, targetPeerId: this.id, ...payload },
      () => !this.closed,
    );
  }

  receive(type, signal) {
    this.incoming = this.incoming
      .then(async () => {
        if (this.closed) return;
        if (type === 'ice') {
          if (this.ignoreOffer) return;
          if (!this.pc.remoteDescription) {
            if (this.pendingIce.length >= 256)
              throw new Error('ICE queue full. Rejoin.');
            this.pendingIce.push(signal.candidate);
          } else await this.pc.addIceCandidate(signal.candidate);
          return;
        }
        const collision =
          type === 'offer' &&
          (this.makingOffer || this.pc.signalingState !== 'stable');
        this.ignoreOffer = !this.polite && collision;
        if (this.ignoreOffer) {
          this.pendingIce = [];
          return;
        }
        await this.pc.setRemoteDescription({ type, sdp: signal.sdp });
        for (const candidate of this.pendingIce.splice(0)) {
          try {
            await this.pc.addIceCandidate(candidate);
          } catch {
            /* A rolled-back offer can leave obsolete candidates. */
          }
        }
        if (type === 'offer') {
          await this.pc.setLocalDescription();
          await this.send('voice:answer', {
            sdp: this.pc.localDescription.sdp,
          });
        }
      })
      .catch((error) => this.report(error));
  }

  addScreen(stream) {
    this.screenSender = this.pc.addTrack(stream.getVideoTracks()[0], stream);
  }

  removeScreen() {
    if (this.screenSender && !this.closed)
      this.pc.removeTrack(this.screenSender);
    this.screenSender = null;
  }

  report(error) {
    if (!this.closed && !this.session.closed)
      this.session.callbacks.error(error.message);
  }

  close() {
    this.closed = true;
    this.pc.onicecandidate = null;
    this.pc.ontrack = null;
    this.pc.onconnectionstatechange = null;
    this.pc.onnegotiationneeded = null;
    this.pc.close();
    this.pendingIce = [];
  }
}

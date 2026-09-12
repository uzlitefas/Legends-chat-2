import { VoiceRoomView } from "@/components/voice/voice-room"

export default async function VoicePage({ params }: {
  params: Promise<{ serverId: string; groupId: string; teamId: string }>
}) {
  return <VoiceRoomView {...await params} />
}

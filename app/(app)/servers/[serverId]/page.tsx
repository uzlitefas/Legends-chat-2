import { ServerDetailsView } from "@/components/server/server-details"

export default async function ServerPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  return <ServerDetailsView serverId={serverId} />
}

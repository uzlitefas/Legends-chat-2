import { GroupDetailsView } from "@/components/group/group-details"

export default async function GroupPage({ params }: { params: Promise<{ serverId: string; groupId: string }> }) {
  const { serverId, groupId } = await params
  return <GroupDetailsView serverId={serverId} groupId={groupId} />
}

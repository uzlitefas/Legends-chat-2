import type { Team } from "@/type/team-type/teamtype"
import Link from "next/link"

export function TeamList({ teams }: { teams: Team[] }) {
  return <section>
    <h2>Teamlar</h2>
    {teams.length === 0 && <p>Bu guruhda teamlar yo‘q.</p>}
    <ul>{teams.map((team) => <li key={team.id}>
      <h3>{team.name}</h3>
      <Link href={`/servers/${encodeURIComponent(team.serverId)}/groups/${encodeURIComponent(team.groupId)}/teams/${encodeURIComponent(team.id)}/voice`}>Ovozli suhbatni ochish</Link>
      <dl>
        <dt>Team ID</dt><dd>{team.id}</dd>
        <dt>Guruh ID</dt><dd>{team.groupId}</dd>
        <dt>Server ID</dt><dd>{team.serverId}</dd>
        <dt>Yaratilgan</dt><dd>{team.createdAt}</dd>
        <dt>Yangilangan</dt><dd>{team.updatedAt}</dd>
      </dl>
    </li>)}</ul>
  </section>
}

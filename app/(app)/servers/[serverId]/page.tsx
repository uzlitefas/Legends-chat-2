export default async function ServerPage({ params }: { params: Promise<{ serverId: string }> }) {
  const { serverId } = await params
  return <main><h1>Server</h1><p>Server ID: {serverId}</p></main>
}

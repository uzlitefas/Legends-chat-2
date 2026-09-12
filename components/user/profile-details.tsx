import type { UserProfile } from "@/type/user-type/usertype"

export function ProfileDetails({ profile }: { profile: UserProfile }) {
  const fields: [string, string | number | null][] = [
    ["ID", profile.id], ["Username", profile.username],
    ["Ism", profile.firstname], ["Familiya", profile.lastname],
    ["Yosh", profile.age], ["Rollar", profile.roles.join(", ")],
    ["Hisob turi", profile.accountType], ["Holat", profile.status],
    ["Sarlavha", profile.title], ["Bio", profile.bio], ["Taxallus", profile.nikname],
    ["Holat matni", profile.textstatus], ["Avatar URL", profile.avatar],
    ["Banner URL", profile.banner], ["Premium", profile.premium ? "Ha" : "Yo'q"],
    ["Yaratilgan", profile.createdAt], ["Yangilangan", profile.updatedAt],
  ]
  return <dl>{fields.map(([label, value]) => (
    <div key={label}><dt>{label}</dt><dd>{value ?? "Kiritilmagan"}</dd></div>
  ))}</dl>
}

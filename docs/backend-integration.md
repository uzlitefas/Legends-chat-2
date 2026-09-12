# Backendni frontendga ulash — 7 qism

Manba: yonma-yon joylashgan ../legends-chat-2-back kodi va docs hujjatlari.
Har qism alohida yoziladi; foydalanuvchi tekshiradi, commit va push qiladi.
Yangi interfeyslar oddiy HTML: ranglar, CSS va dizayn qo'shilmaydi.

| Qism | Ish | Holat |
| --- | --- | --- |
| 1 | Auth types, service, store, login/register, cookie refresh, logout, serverga yo'naltirish | Kod yozildi, tekshirilmagan |
| 2 | User profili, user settings, premium; type/service/store/component/page | Kutilmoqda |
| 3 | Serverlar ro'yxati, yaratish, tafsilot va nom sozlamalari; barcha qatlamlar | Kutilmoqda |
| 4 | Server a'zolarini qo'shish/chiqarish va SERVER_USER yaratish; barcha qatlamlar | Kutilmoqda |
| 5 | Guruhlar, a'zolar va canEnter sozlamalari; barcha qatlamlar | Kutilmoqda |
| 6 | Team yaratish va guruh ichida ko'rsatish; barcha qatlamlar | Kutilmoqda |
| 7 | Voice HTTP/ICE, Socket.IO, WebRTC, mikrofon, quloqchin, ekran, reconnect; barcha qatlamlar | Kutilmoqda |

## 1-qism fayllari

- type/auth-type/authtype.ts: backend login/refresh javobi, hisob turi va store turlari.
- service/auth.service.ts: beshta auth endpoint. Logoutga Bearer header qo'shildi.
- stores/use-auth-store.ts: kirish, ro'yxatdan o'tish, sessiyani tiklash/yangilash, chiqish va xatolar.
- lib/auth-route.ts: defaultServerId orqali boshlang'ich sahifa.
- components/auth/: sessiya chegarasi, oddiy auth formasi va sessiya tugmalari.
- app/login/, app/register/: kirish va ro'yxatdan o'tish.
- app/(app)/layout.tsx: sessiyani tiklash va kirishni talab qilish.
- app/(app)/(home)/page.tsx: oddiy hisobning boshlang'ich sahifasi.
- app/(app)/servers/[serverId]/page.tsx: maxsus hisob uchun yo'nalish.
  Hozir faqat ID ko'rsatadi; server ma'lumotlari 3-qismda ulanadi.

Access token faqat xotirada saqlanadi. Sahifa yangilanganda backendning HttpOnly
refresh cookie-si orqali sessiya tiklanadi. API so'rovlari credentials: include
ishlatadi. NEXT_PUBLIC_API_URL API prefiksi bilan beriladi
(standart: http://localhost:3001/api). Backend CORS frontend originiga va
cookie bilan so'rovlarga ruxsat berishi kerak.

AuthBoundary navigatsiyani boshqaradi; haqiqiy ruxsatni backend tekshiradi.
Login/register formalarida backenddagi email va parol uzunligi chegaralari ishlatiladi.
Sessiyani yangilash tugmasi mavjud; keyingi service so'rovlari uchun umumiy avtomatik
401 retry hali kiritilmagan. Logout 401 olsa refresh qilib bir marta qayta yuboradi.
Mavjud global CSS o'zgartirilmagan; auth sahifalarida dizayn classlari ishlatilmaydi.

Foydalanuvchi so'roviga ko'ra test, lint, build va haqiqiy API sinovlari bajarilmadi.
Commit va push bajarilmadi. Keyingi qism foydalanuvchi davom ettirishni aytganda yoziladi.

1-qism uchun commit nomi: feat(auth): connect backend authentication and session pages

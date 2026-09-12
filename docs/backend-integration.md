# Backendni frontendga ulash — 7 qism

Manba: yonma-yon joylashgan ../legends-chat-2-back kodi va docs hujjatlari.
Har qism alohida yoziladi; foydalanuvchi tekshiradi, commit va push qiladi.
Yangi interfeyslar oddiy HTML: ranglar, CSS va dizayn qo'shilmaydi.

| Qism | Ish | Holat |
| --- | --- | --- |
| 1 | Auth types, service, store, login/register, cookie refresh, logout, serverga yo'naltirish | Kod yozildi, tekshirilmagan |
| 2 | User profili, user settings, premium; type/service/store/component/page | Kod yozildi, tekshirilmagan |
| 3 | Serverlar ro'yxati, yaratish, tafsilot va nom sozlamalari; barcha qatlamlar | Kod yozildi, tekshirilmagan |
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

## 2-qism fayllari

- `type/user-type/usertype.ts`: accountType, assignedServerId, defaultServerId,
  PATCH javobi va user store turlari.
- `type/premium-type/premiumtype.ts`: premium payload va javob turlari.
- `service/user.service.ts`: PATCH javobidagi assignedServerId orqali defaultServerId tiklanadi.
- `service/premium.service.ts`: PATCH /premium/:id.
- `stores/use-user-store.ts`: profilni yuklash, tahrirlash, boshqa profilni olish,
  user settings va premium amallari; loading, error, success holatlari.
  Logoutda eski so'rov natijalari bekor qilinadi.
- `components/user/`: profil tafsilotlari, tahrirlash, ID orqali profil qidirish,
  admin sozlamalari va so'rov natijasini ko'rsatish componentlari.
- `app/(app)/profile/page.tsx`: /profile — o'z profilini ko'rish va tahrirlash.
- `app/(app)/users/page.tsx`: /users — ID orqali ochiq profilni olish.
- `app/(app)/users/settings/page.tsx`: /users/settings — SUPER_ADMIN uchun
  rollar/premium va alohida premium endpointi.
- `components/auth/session-panel.tsx`: yangi sahifalarga havolalar.
- `components/auth/auth-boundary.tsx`: SERVER_USER hisobiga /profile va /users
  sahifalarini ochishga ruxsat; foydalanuvchilar doirasini backend tekshiradi.

Profil formasi faqat o'zgargan maydonlarni yuboradi. Bo'shatilgan ixtiyoriy
maydonlar null, bo'sh do'stlar ro'yxati [] sifatida yuboriladi. Backenddagi
`nikname` va `phonenuber` yozilishi aynan saqlangan. Avatar/banner fayl yuklash
emas, URL maydonlari. Account type va assigned server profil orqali yuborilmaydi.

Admin formasida rollarni va/yoki premiumni o'zgartirish alohida belgilanadi.
Rollar tanlangan ro'yxat bilan to'liq almashtiriladi. Premiumning alohida formasi
PATCH /premium/:id endpointiga ulanadi. Haqiqiy ruxsatni backend tekshiradi.

Bu qismda avtomatik token refresh/retry kiritilmadi; access token tugaganda
sessiyani yangilash tugmasidan foydalanib so'rovni qayta yuborish mumkin.
Test, lint, build, API sinovlari, commit va push bajarilmadi.

2-qism uchun commit nomi: `feat(user): connect profile settings and premium`.
Keyingi qism: serverlar ro'yxati, yaratish, tafsilot va nom sozlamalari.

## 3-qism fayllari

- `type/server-type/servertype.ts`: server, ro'yxat/yaratish/sozlash javobi,
  tafsilotlar va a'zolarning ochiq maydonlari, payload va store turlari.
- `service/server.service.ts`: GET /servers, GET /servers/:id,
  POST /servers va PATCH /servers/:id/settings.
- `stores/use-server-store.ts`: ro'yxat, tanlangan server, yaratish va nomni
  saqlash. Loading, xato va muvaffaqiyat holatlari. Eski o'qish natijasi yangi
  server tanlovini almashtirmaydi; logoutda kutilayotgan natijalar bekor qilinadi.
- `components/server/`: ro'yxat, yaratish formasi, tafsilot va nom sozlamalari.
- `app/(app)/(home)/page.tsx` va `app/(app)/servers/page.tsx`: serverlar ro'yxati.
- `app/(app)/servers/[serverId]/page.tsx`: haqiqiy backend tafsilotlari.
- `stores/use-auth-store.ts`: logout yoki hisob almashganda server store tozalanadi.
- `components/auth/session-panel.tsx`: oddiy hisoblar uchun serverlar havolasi.

SUPER_ADMIN yangi server egasining mavjud User ID qiymatini kiritadi. Agar
server boshqa userga berilsa, u yaratuvchining serverlari ro'yxatiga qo'shilmaydi;
yaratilgan server IDsi alohida ko'rsatiladi. Backend haqiqiy huquqni tekshiradi.
Nomni faqat ownerId joriy user IDga teng bo'lganda tahrirlash formasi ko'rsatiladi.
Nom 1–100 belgidan iborat; egalikni almashtirish amali yo'q.

SERVER_USER avvalgidek bevosita biriktirilgan serveriga yo'naltiriladi.
Tafsilotda a'zolar o'qiladi; a'zo qo'shish/chiqarish va maxsus hisob yaratish 4-qismda.
Token yangilash avvalgi sessiya tugmasi orqali bajariladi.
Test, lint, build, API sinovlari, commit va push bajarilmadi.

3-qism uchun commit nomi: `feat(server): connect server list creation and settings`.
Keyingi qism: server a'zolari va SERVER_USER hisoblarini boshqarish.

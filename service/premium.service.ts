import { apiRequest } from "@/service/api"
import type { PremiumResponse, UpdatePremiumPayload } from "@/type/premium-type/premiumtype"

export const premiumService = {
  async update(id: string, payload: UpdatePremiumPayload, accessToken: string): Promise<PremiumResponse> {
    if (!id.trim()) throw new Error("User ID talab qilinadi")
    if (!accessToken.trim()) throw new Error("Access token talab qilinadi")
    return apiRequest<PremiumResponse>(`premium/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    })
  },
}

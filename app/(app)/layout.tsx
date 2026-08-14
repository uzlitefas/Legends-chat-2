import { ChildProps } from "@/types/props"

function layout({ children }: ChildProps) {
  return (
    <div>
      {children}
    </div>
  )
}

export default layout

import type { Meta, StoryObj } from "@storybook/react"
import React, { useState } from "react"
import { EmergencyPagination } from "../../molecules/EmergencyPagination/EmergencyPagination"
import { injectEmergencyTokens } from "../../tokens/emergency.tokens"

injectEmergencyTokens()

function PaginationDemo({ total, pages }: { total: number; pages: number }) {
  const [page, setPage] = useState(1)
  return (
    <EmergencyPagination
      totalItems={total}
      currentPage={page}
      totalPages={pages}
      onPageChange={setPage}
    />
  )
}

const meta: Meta = {
  title:      "Molecules/EmergencyPagination",
  tags:       ["autodocs"],
  parameters: { layout: "fullscreen" },
}
export default meta

export const Default: StoryObj = {
  render: () => <PaginationDemo total={127} pages={13} />,
}

export const PocasPaginas: StoryObj = {
  render: () => <PaginationDemo total={30} pages={3} />,
}

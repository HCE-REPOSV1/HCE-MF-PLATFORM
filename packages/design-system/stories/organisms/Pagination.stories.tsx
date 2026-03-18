import type { Meta, StoryObj } from "@storybook/react"
import React, { useState } from "react"
import { Pagination } from "../../organisms/Pagination/Pagination"

function PaginationDemo({ total }: { total: number }) {
  const [page, setPage] = useState(1)
  return <Pagination page={page} total={total} onChange={setPage} />
}

const meta: Meta = {
  title: "Organisms/Pagination",
  tags:  ["autodocs"],
}
export default meta

export const Default: StoryObj = {
  render: () => <PaginationDemo total={10} />,
}

export const MuchasPaginas: StoryObj = {
  render: () => <PaginationDemo total={50} />,
}

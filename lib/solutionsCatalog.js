import {
  RadioTower,
  Cable,
  Network,
  Layers,
  Factory,
  Server,
  Code2,
  ShoppingCart,
  Truck,
  Landmark,
} from "lucide-react"

/**
 * Public landing solutions — shared by Header nav and /solutions page (anchors).
 */
export const SOLUTION_SECTIONS = [
  { id: "indoor-wireless", headerPrefix: "sol_indoor", Icon: RadioTower },
  { id: "isp", headerPrefix: "sol_isp", Icon: Cable },
  { id: "networking", headerPrefix: "sol_networking", Icon: Network },
  { id: "core", headerPrefix: "sol_core", Icon: Layers },
  { id: "iot", headerPrefix: "sol_iot", Icon: Factory },
  { id: "it", headerPrefix: "sol_it", Icon: Server },
  { id: "tech", headerPrefix: "sol_tech", Icon: Code2 },
  { id: "ecommerce", headerPrefix: "sol_ecommerce", Icon: ShoppingCart },
  { id: "logistics", headerPrefix: "sol_logistics", Icon: Truck },
  { id: "fintech", headerPrefix: "sol_fintech", Icon: Landmark },
]

/** Maps section id → SolutionsPage translation key prefix (e.g. indoor_title). */
export const PAGE_KEY_BY_ID = {
  "indoor-wireless": "indoor",
  isp: "isp",
  networking: "networking",
  core: "core",
  iot: "iot",
  it: "it",
  tech: "tech",
  ecommerce: "ecommerce",
  logistics: "logistics",
  fintech: "fintech",
}

export interface MockProject {
  id: string
  name: string
  slug: string
  owned: boolean
}

export const MOCK_MY_PROJECTS: MockProject[] = [
  { id: "1", name: "Microservices Platform", slug: "microservices-platform", owned: true },
  { id: "2", name: "Event Driven System", slug: "event-driven-system", owned: true },
]

export const MOCK_SHARED_PROJECTS: MockProject[] = [
  { id: "3", name: "Shared Architecture", slug: "shared-architecture", owned: false },
]

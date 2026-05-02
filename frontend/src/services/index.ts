export {
  mobileUsersApi,
  type MobileUserCreateBody,
  type MobileUserCreated,
  type MobileUserListItem,
  type MobileUserRouteOption,
} from "./mobileUsers.api";
export {
  webUsersApi,
  type WebUserCreateBody,
  type WebUserDetail,
  type WebUserListItem,
  type WebUserPermissionMode,
  type WebUserUpdateBody,
} from "./webUsers.api";
export { vehiclesApi, type VehicleWriteBody } from "./vehicles.api";
export { webRolesApi } from "./webRoles.api";
export type { ApiResourceId } from "@/domain/apiResourceId";
export type {
  RolWebCreateBody,
  RolWebDetail,
  RolWebListItem,
  RolWebOpcion,
  RolWebUpdateBody,
} from "@/domain/webRoles";
export { routesApi } from "./routes.api";
export { ordersApi } from "./orders.api";
export { fleetApi } from "./fleet.api";

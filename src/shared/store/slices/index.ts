import { OrderState } from "./orderSlice";
import userReducer from "@/entities/user/model/slice/userStore";
import orderReducer from "./orderSlice";

export { orderReducer, userReducer };
export type { OrderState };

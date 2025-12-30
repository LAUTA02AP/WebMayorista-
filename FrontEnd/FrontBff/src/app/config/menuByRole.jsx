import { Home, Package, Box ,ShoppingCart} from "lucide-react";


export const MENU_BY_ROLE = {
  "1": [
    { label: "Inicio", to: "/home", icon:Home},
    { label: "Pedidos", to: "/pedidos", icon:Package},
    { label: "Productos", to: "/productos", icon:Box },
    { label: "Carrito", to: "/cart", icon: ShoppingCart }
  ],
};

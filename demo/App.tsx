import { CRM } from "@/components/neon-crm/root/CRM";
import {
  authProvider,
  dataProvider,
} from "@/components/neon-crm/providers/fakerest";
import { memoryStore } from "ra-core";

const App = () => (
  <CRM
    dataProvider={dataProvider}
    authProvider={authProvider}
    store={memoryStore()}
  />
);

export default App;

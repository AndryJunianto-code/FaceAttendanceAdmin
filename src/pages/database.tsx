import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { DatabaseView } from 'src/sections/user/view/database-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Face Recognition Admin</title>
      </Helmet>

      <DatabaseView />
    </>
  );
}

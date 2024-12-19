import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { AddFaceView } from 'src/sections/user/view/addface-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Face Recognition Admin</title>
      </Helmet>

      <AddFaceView />
    </>
  );
}

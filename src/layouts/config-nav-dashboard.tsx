import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  
  {
    title: 'Validation',
    path: '/validation',
    icon: icon('ic-user'),
  },
  {
    title: 'Report',
    path: '/report',
    icon: icon('ic-lock'),
  },
  {
    title: 'Add Face',
    path: '/addface',
    icon: icon('ic-blog'),
  },
];

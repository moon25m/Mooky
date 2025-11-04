import React from 'react';
import MookyLogo from './MookyLogo';

type Props = React.ComponentProps<typeof MookyLogo>;

export default function MookyLogoDefault(props: Props) {
  return <MookyLogo {...props} />;
}

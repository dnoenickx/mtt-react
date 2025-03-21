import { Text, Timeline as MantineTimeline } from '@mantine/core';
import {} from // IconExternalLink,
// IconBarrierBlock,
// IconRuler,
// IconConfetti,
// IconLicense,
// IconBulldozer,
// Icon,
// IconGitBranch,
// IconGitPullRequest,
// IconGitCommit,
// IconMessageDots,
// IconPencilDollar,
// IconShovel,
// IconGardenCart,
// IconWreckingBall,
// IconEdit,
// IconCertificate
// IconCertificate2
// IconFileCertificate
'@tabler/icons-react';
import { formatDateWithPrecision } from '@/utils';

import { TrailEvent } from '../../types';
import { LinkGroup, MultiLineText } from '../Atomic/Atomic';

// function getIcon(iconName: string) {
//   const size = 14;
//   switch (iconName) {
//     case 'IconConfetti':
//       return <IconConfetti size={size} />;
//     case 'IconRuler':
//       return <IconRuler size={size} />;
//     case 'IconBulldozer':
//       return <IconBulldozer size={size + 1} />;
//     case 'IconBarrierBlock':
//       return <IconBarrierBlock size={size} stroke={1.25} />;
//     case 'IconLicense':
//       return <IconLicense />;
//     default:
//       return <></>;
//   }
// }

export function Timeline({ events }: { events: TrailEvent[] }) {
  const currentDate = new Date();
  const past = events.filter((event) => new Date(event.date) < currentDate).length - 1;

  return (
    <MantineTimeline active={past} reverseActive lineWidth={3} bulletSize={24}>
      {events
        .sort((a, b) => (a.date > b.date ? -1 : 1))
        .map(({ id, headline, date, date_precision, description, links }) => (
          <MantineTimeline.Item
            key={id}
            title={headline}
            lineVariant={new Date(date) < currentDate ? 'solid' : 'dashed'}
            styles={{
              itemTitle: { lineHeight: '24px' },
              itemBullet: { backgroundColor: 'var(--mantine-color-body)' },
            }}
          >
            <Text size="xs" my={4}>
              {formatDateWithPrecision(date, date_precision)}
            </Text>
            <MultiLineText c="dimmed" size="sm" text={description} />
            <LinkGroup links={links} />
          </MantineTimeline.Item>
        ))}
    </MantineTimeline>
  );
}

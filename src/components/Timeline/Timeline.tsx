import { Skeleton, Text, Timeline as MantineTimeline } from '@mantine/core';
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
import { formatDate } from '@/utils';

import { TrailEvent } from '../../types';
import { LinkGroup, MultiLineText, SkeletonParagraph } from '../Atomic/Atomic';

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
  const past = events.filter((event) => event.date < currentDate).length - 1;

  return (
    <MantineTimeline active={past} reverseActive lineWidth={3} bulletSize={24}>
      {events
        .sort((a, b) => (a.date > b.date ? -1 : 1))
        .map(({ id, headline, date, date_precision, description, links }) => (
          <MantineTimeline.Item
            key={id}
            title={headline}
            lineVariant={date < currentDate ? 'solid' : 'dashed'}
          >
            <Text size="xs" mt={4}>
              {formatDate(date, date_precision)}
            </Text>
            <MultiLineText c="dimmed" size="sm" text={description} />
            <LinkGroup links={links} />
          </MantineTimeline.Item>
        ))}
    </MantineTimeline>
  );
}

export function LoadingTimeline() {
  return (
    <MantineTimeline lineWidth={3} bulletSize={24}>
      <MantineTimeline.Item>
        <Skeleton height={24} radius="lg" width="65%" />
        <Skeleton height={12} mt={4} radius="lg" width="30%" />
        <SkeletonParagraph lines={4} height={12} mt={4} radius="xl" />
      </MantineTimeline.Item>
      <MantineTimeline.Item>
        <Skeleton height={24} radius="lg" width="65%" />
        <Skeleton height={12} mt={4} radius="lg" width="30%" />
        <SkeletonParagraph lines={4} height={12} mt={4} radius="xl" />
      </MantineTimeline.Item>
    </MantineTimeline>
  );
}

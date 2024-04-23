import { Text, Timeline as MantineTimeline } from '@mantine/core';
import {
  // IconExternalLink,
  IconBarrierBlock,
  IconRuler,
  IconConfetti,
  IconLicense,
  IconBulldozer,
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
} from '@tabler/icons-react';
import { formatDate } from '@/utils';

import { Newsflash } from '../../types';

function getIcon(iconName: string) {
  const size = 14;
  switch (iconName) {
    case 'IconConfetti':
      return <IconConfetti size={size} />;
    case 'IconRuler':
      return <IconRuler size={size} />;
    case 'IconBulldozer':
      return <IconBulldozer size={size + 1} />;
    case 'IconBarrierBlock':
      return <IconBarrierBlock size={size} stroke={1.25} />;
    case 'IconLicense':
      return <IconLicense />;
    default:
      return <></>;
  }
}

export function Timeline({ events }: { events: Newsflash[] }) {
  const currentDate = new Date();
  const past = events.filter((event) => event.date < currentDate).length - 1;

  return (
    <MantineTimeline active={past} reverseActive lineWidth={3} bulletSize={24}>
      {events
        .sort((a, b) => (a.date > b.date ? -1 : 1))
        .map(({ headline, icon, date, datePrecision, description }) => (
          <MantineTimeline.Item
            title={headline}
            bullet={getIcon(icon)}
            lineVariant={date < currentDate ? 'solid' : 'dashed'}
          >
            <Text size="xs" mt={4}>
              {formatDate(date, datePrecision)}
            </Text>
            <Text c="dimmed" size="sm">
              {description}
            </Text>
            {/* {links.length > 0 && (
              <Flex gap={5} justify="flex-start" align="center" direction="row" wrap="wrap" py={4}>
                {links.map(({ label, url }) => (
                  <a href={url} target="_blank" rel="nofollow">
                    <Button
                      size="compact-sm"
                      c="dimmed"
                      leftSection={<IconExternalLink size={14} />}
                      variant="default"
                    >
                      {label}
                    </Button>
                  </a>
                ))}
              </Flex>
            )} */}
          </MantineTimeline.Item>
        ))}
    </MantineTimeline>
  );
}

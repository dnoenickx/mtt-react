import { Button, Flex, Text, Timeline as MantineTimeline } from '@mantine/core';
import {
  // IconExternalLink,
  IconBarrierBlock,
  IconRuler,
  IconConfetti,
  IconLicense,
  IconBulldozer,
  IconExternalLink,
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
        .map(({ id, headline, icon, date, datePrecision, description, links }) => (
          <MantineTimeline.Item
            key={id}
            title={headline}
            bullet={getIcon(icon)}
            lineVariant={date < currentDate ? 'solid' : 'dashed'}
          >
            <Text size="xs" mt={4}>
              {formatDate(date, datePrecision)}
            </Text>
            {description.split('\n').map((str) => (
              <Text c="dimmed" size="sm">
                {str}
              </Text>
            ))}
            <Flex gap={5} justify="flex-start" align="center" direction="row" wrap="wrap" py={4}>
              {links.map(({ label, url }) => (
                <a href={url} target="_blank" rel="nofollow noreferrer" key={url}>
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
          </MantineTimeline.Item>
        ))}
    </MantineTimeline>
  );
}

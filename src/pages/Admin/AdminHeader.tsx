import { Link as RouterLink } from 'react-router-dom';
import { Alert, Spoiler, Anchor, Group, Button, rem } from '@mantine/core';
import { IconEraser, IconCheck, IconMapDown, IconBrandYoutubeFilled } from '@tabler/icons-react';
import { useSessionStorage } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { handleDownload } from '@/utils';
import { EmailButton } from '@/components/Atomic/Atomic';
import ConfirmationButton from '@/components/ConfirmationButton';
import { useData } from '@/components/DataProvider/DataProvider';

interface AdminHeaderProps {
  showDownloadButton: boolean;
}

export default function AdminHeader({ showDownloadButton }: AdminHeaderProps): JSX.Element {
  const { clearChanges, getCurrentJSON } = useData();
  const [spoilerOpen, setSpoilerOpen] = useSessionStorage({
    key: 'admin-spoiler',
    defaultValue: true,
    getInitialValueInEffect: false,
  });

  return (
    <>
      <Alert variant="outline" title="Welcome" mb="xl">
        <Spoiler
          expanded={spoilerOpen}
          onExpandedChange={setSpoilerOpen}
          maxHeight={0}
          showLabel="Show more"
          hideLabel="show less"
          styles={{ control: { fontSize: '14px' } }}
        >
          <ul>
            <li>This page allows you to suggest edits to the map data!</li>
            <li>
              You&apos;ll be able to see your edits throughout the site, but they won&apos;t be
              visible to anyone else until I approve them.
            </li>
          </ul>
          How the data is organized:
          <ul>
            <li>A trail is a collection of segments. Segments can belong to multiple trails.</li>
            <li>
              Both trails and segments can have names, descriptions, and links attached to them.
            </li>
            <li>
              Segments have timelines comprised of events. Events can be shared across segments.
            </li>
          </ul>
          Examples of segments with detailed information:
          <ul>
            <li>
              <Anchor size="sm" component={RouterLink} to="/map?segment=130" target="_blank">
                Sudbury-Hudson MCRT Extension
              </Anchor>
            </li>
            <li>
              <Anchor size="sm" component={RouterLink} to="/map?segment=52" target="_blank">
                Mystic River Bridge
              </Anchor>
            </li>
            <li>
              <Anchor size="sm" component={RouterLink} to="/map?segment=172" target="_blank">
                Northern Strand Lynn Extension
              </Anchor>
            </li>
            <li>
              <Anchor size="sm" component={RouterLink} to="/map?segment=4" target="_blank">
                Swampscott Rail Trail
              </Anchor>
            </li>
            <li>
              <Anchor size="sm" component={RouterLink} to="/map?segment=331" target="_blank">
                New Hampshire Seacost Greenway
              </Anchor>
            </li>
          </ul>
          <Group>
            <span>Reach out if you have any questions:</span>
            <EmailButton />
          </Group>
          <Group mt="lg">
            <span>Watch this video for more information</span>
            <Button
              leftSection={<IconBrandYoutubeFilled />}
              component={RouterLink}
              to="https://youtu.be/uIw3X7h3BeM"
              color="red"
              variant="light"
            >
              About + How to Suggest Edits
            </Button>
          </Group>
        </Spoiler>
      </Alert>

      <Group justify="flex-end">
        {showDownloadButton && (
          <Button
            leftSection={<IconMapDown style={{ width: rem(14), height: rem(14) }} />}
            onClick={() => handleDownload('updated_data.json', getCurrentJSON())}
            variant="outline"
            size="xs"
          >
            Download All Data
          </Button>
        )}
        <ConfirmationButton
          confirmationText="All edits will be cleared from your browser. Submitted changes will still be available for me to review, but any unsubmitted changes will be permanently lost."
          onConfirm={() => {
            clearChanges();
            showNotification({
              withBorder: true,
              withCloseButton: false,
              title: 'Edits Cleared',
              message: 'Now viewing current published data',
              position: 'top-center',
              icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
              m: 'lg',
            });
          }}
          confirmButtonText="Clear"
          cancelButtonText="Cancel"
          modalProps={{
            title: 'Clear edits?',
          }}
        >
          <Button
            leftSection={<IconEraser style={{ width: rem(14), height: rem(14) }} />}
            color="red"
            variant="outline"
            size="xs"
          >
            Clear Edits
          </Button>
        </ConfirmationButton>
      </Group>
    </>
  );
}

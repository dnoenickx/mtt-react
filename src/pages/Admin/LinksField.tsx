import {
  TextInput,
  ActionIcon,
  Group,
  Box,
  Button,
  Fieldset,
  Text,
  BoxProps,
  Flex,
} from '@mantine/core';
import { IconTrash, IconGripVertical } from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { randomId } from '@mantine/hooks';

export type FormLink = {
  id: string;
  text: string;
  url: string;
};

interface LinksFieldProps extends BoxProps {
  value?: FormLink[];
  onChange: (links: FormLink[]) => void;
  description?: string;
}

const LinksField = ({ value = [], onChange, description, ...boxProps }: LinksFieldProps) => {
  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const reordered = Array.from(value);
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);
    onChange(reordered);
  };

  const updateLink = (index: number, updatedLink: Partial<FormLink>) => {
    const updatedLinks = value.map((link, i) => (i === index ? { ...link, ...updatedLink } : link));
    onChange(updatedLinks);
  };

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addLink = () => {
    onChange([...value, { id: randomId(), text: '', url: '' }]);
  };

  return (
    <Box {...boxProps}>
      <Text size="sm" fw={500}>
        Links
        <Button size="compact-sm" variant="transparent" onClick={addLink}>
          (add link)
        </Button>
      </Text>
      {description && (
        <Text color="dimmed" size="12px" lh="14.4px">
          {description}
        </Text>
      )}
      <Box mt="sm">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="links-list" direction="vertical">
            {(droppableProvided) => (
              <Box ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                {value.map((link, index) => (
                  <Draggable key={link.id} draggableId={link.id} index={index}>
                    {(draggableProvided) => (
                      <Fieldset
                        ref={draggableProvided.innerRef}
                        variant="default"
                        mt="lg"
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        p={{ base: 'xs', sm: 'md' }}
                      >
                        <Group align="center">
                          <ActionIcon
                            title="Reorder"
                            variant="subtle"
                            {...draggableProvided.dragHandleProps}
                          >
                            <IconGripVertical size="1.2rem" />
                          </ActionIcon>

                          <Flex
                            direction={{ base: 'column', sm: 'row' }}
                            align={{ sm: 'flex-end' }}
                            gap="sm"
                            style={{ flex: 1 }}
                          >
                            <TextInput
                              label="Text"
                              placeholder="Link text"
                              value={link.text}
                              onChange={(e) => updateLink(index, { text: e.target.value })}
                              style={{ flex: 1 }}
                            />
                            <TextInput
                              label="URL"
                              placeholder="www.bostonglobe.com"
                              value={link.url}
                              onChange={(e) => updateLink(index, { url: e.target.value })}
                              style={{ flex: 2 }}
                            />
                            <ActionIcon
                              title="Delete Link"
                              variant="subtle"
                              color="red"
                              onClick={() => removeLink(index)}
                            >
                              <IconTrash size="1rem" />
                            </ActionIcon>
                          </Flex>
                        </Group>
                      </Fieldset>
                    )}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
      {/* <Group justify="center" mt="md">
        <Button
          size="compact-sm"
          variant="outline"
          onClick={addLink}
          leftSection={<IconPlus size="1rem" />}
        >
          Add Link
        </Button>
      </Group> */}
    </Box>
  );
};

export default LinksField;

export function toRawLinks(links: FormLink[]) {
  return links
    .map((link) => ({
      text: link.text,
      url: link.url,
    }))
    .filter((link) => link.text !== '' || link.url !== '');
}

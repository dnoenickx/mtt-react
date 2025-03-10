import React, { useRef } from 'react';
import { useHotkeys } from '@mantine/hooks';
import { ActionIcon, Stack, Tooltip, Divider } from '@mantine/core';
import {
  IconArrowMerge,
  IconClipboardData,
  IconCopy,
  IconFileUpload,
  IconMapPinMinus,
  IconPointer,
  IconRestore,
  IconScissors,
  IconTrash,
  IconWriting,
} from '@tabler/icons-react';
import { EditorMode, GeometryEditorState } from './types';
import {
  handleCopySelectedLines,
  handlePasteLines,
  handleDeleteSelectedLines,
  handleCombineLines,
  handleFileUpload,
  handleSimplifyLine,
} from './Actions';

interface ModeButtonProps {
  mode: EditorMode;
  currentMode: EditorMode;
  setMode: React.Dispatch<React.SetStateAction<EditorMode>>;
  label: string;
  icon: React.ReactNode;
}

const ModeButton: React.FC<ModeButtonProps> = ({ mode, currentMode, setMode, label, icon }) => (
  <Tooltip label={label} position="left">
    <ActionIcon
      variant={currentMode === mode ? 'filled' : 'outline'}
      onClick={() => setMode(mode)}
      size="xl"
    >
      {icon}
    </ActionIcon>
  </Tooltip>
);

export const EditorSidebar = (props: GeometryEditorState & { reset: () => void }) => {
  const { mapRef, mode, setMode, selectedLineIds, setLines } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useHotkeys([
    ['mod+c', () => handleCopySelectedLines(props)],
    ['mod+v', () => handlePasteLines(props)],
  ]);

  const hasSelection = selectedLineIds.length > 0;
  const hasMultipleSelection = selectedLineIds.length > 1;

  return (
    <Stack
      gap="sm"
      pos="absolute"
      top={10}
      right={10}
      style={{
        zIndex: 1000,
      }}
    >
      {/* Modes Panel */}
      <Stack
        gap="xs"
        bg="rgba(255, 255, 255, 0.8)"
        p="xs"
        style={{
          borderRadius: '4px',
        }}
      >
        <ModeButton
          mode="select"
          currentMode={mode}
          setMode={setMode}
          label="Select"
          icon={<IconPointer size={20} />}
        />
        <ModeButton
          mode="draw"
          currentMode={mode}
          setMode={setMode}
          label="Draw"
          icon={<IconWriting size={20} />}
        />
        <ModeButton
          mode="split"
          currentMode={mode}
          setMode={setMode}
          label="Split"
          icon={<IconScissors size={20} />}
        />
      </Stack>

      {/* Actions Panel */}
      <Stack
        gap="xs"
        bg="rgba(255, 255, 255, 0.8)"
        p="xs"
        style={{
          borderRadius: '4px',
        }}
      >
        {/* Content Manipulation Group */}
        <Tooltip label="Copy" position="left">
          <ActionIcon
            variant="outline"
            onClick={() => handleCopySelectedLines(props)}
            disabled={!hasSelection}
            size="xl"
          >
            <IconCopy size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Paste" position="left">
          <ActionIcon variant="outline" onClick={() => handlePasteLines(props)} size="xl">
            <IconClipboardData size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete" position="left">
          <ActionIcon
            variant="outline"
            onClick={() => handleDeleteSelectedLines(props)}
            disabled={!hasSelection}
            size="xl"
            color="red"
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Combine Lines" position="left">
          <ActionIcon
            variant="outline"
            onClick={() => handleCombineLines(props)}
            disabled={!hasMultipleSelection}
            size="xl"
          >
            <IconArrowMerge size={20} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Simplify Line" position="left">
          <ActionIcon
            variant="outline"
            onClick={() => handleSimplifyLine(props)}
            disabled={!hasSelection}
            size="xl"
          >
            <IconMapPinMinus size={20} />
          </ActionIcon>
        </Tooltip>

        <Divider my="xs" />

        {/* File Operations Group */}
        <Tooltip label="Upload GPX/KML/GeoJSON" position="left">
          <ActionIcon variant="outline" onClick={() => fileInputRef.current?.click()} size="xl">
            <IconFileUpload size={20} />
          </ActionIcon>
        </Tooltip>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".gpx,.kml,.json,.geojson"
          onChange={(e) => handleFileUpload(e, setLines, fileInputRef, mapRef)}
        />
        <Tooltip label="Reset" position="left">
          <ActionIcon variant="outline" onClick={props.reset} size="xl">
            <IconRestore size={20} />
          </ActionIcon>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

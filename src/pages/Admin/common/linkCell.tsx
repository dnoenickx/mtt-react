import { List, Anchor } from '@mantine/core';
import { Link } from '@/types';

interface LinkCellItem {
  links: Link[];
}

export default function LinkCell(item: LinkCellItem): JSX.Element {
  return (
    <List size="xs">
      {item.links.map(
        (link) =>
          link && (
            <List.Item key={link.url}>
              <Anchor href={link.url} target="_blank" rel="noopener noreferrer" size="xs">
                {link.text}
              </Anchor>
            </List.Item>
          )
      )}
    </List>
  );
}

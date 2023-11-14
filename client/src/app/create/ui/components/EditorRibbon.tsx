'use client';

import {
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Typography,
} from '@mui/material';
import { Undo, Redo } from '@mui/icons-material';
import styles from './EditorRibbon.module.scss';
import { useState } from 'react';
import EditorMenu, { MenuProps } from './EditorMenu';
import ImportModal from './modals/importModal';
import ChoroplethModal from './modals/choroplethModal';
import MultiMapLabelModal from './modals/multiLabelModal';

export default function () {
  const [openMenu, setOpenMenu] = useState<MenuProps | null>(null);
  const menus = {
    File: {
      Import: {
        'Import File From Local Desktop': () => {
          setOpenImport(true);
        },
        'Import User Owned Maps': () => {},
      },
      Export: {
        'Export As PNG': () => {},
        'Export As SVG': () => {},
        'Export As JSON': () => {},
      },
      Publish: () => {
        alert('Published!');
      },
    },
    View: {
      'Map Label Multi Select': () => {
        setOpenMapLabelModal(true);
      },
      'Choropleth Label Select': () => {
        setOpenChoropleth(true);
      },
    },
    Map: {},
  };
  function handleMenuClose() {
    setOpenMenu(null);
  }

  //--------- Modal States ---------
  const [openImport, setOpenImport] = useState(false);
  const [openChoropleth, setOpenChoropleth] = useState(false);
  const [openMapLabelModal, setOpenMapLabelModal] = useState(false);
  const selectedOptions = [
    'Country Name',
    'Languages',
    'Population',
    'chinese',
    '조선글',
  ];

  function onImportConfirm(mapName: string, optionsProps: string[]) {
    console.log(mapName, optionsProps);

    setOpenImport(false);
  }

  function onChoroplethConfirm(optionsProps: string[]) {
    console.log(optionsProps);

    setOpenChoropleth(false);
  }
  function onMultiMapConfirm(optionsProps: string[]) {
    console.log(optionsProps);

    setOpenMapLabelModal(false);
  }
  return (
    <div className={styles['ribbon-container']}>
      <div className={styles['dropdowns']}>
        <Typography
          onClick={e => {
            setOpenMenu({
              items: menus.File,
              anchorEl: e.currentTarget,
              onClose: handleMenuClose,
              isTopLevel: true,
            });
          }}
        >
          {' '}
          File{' '}
        </Typography>
        <Typography
          onClick={e => {
            setOpenMenu({
              items: menus.View,
              anchorEl: e.currentTarget,
              onClose: handleMenuClose,
              isTopLevel: true,
            });
          }}
        >
          {' '}
          View{' '}
        </Typography>
        <Typography
          onClick={e => {
            setOpenMenu({
              items: menus.Map,
              anchorEl: e.currentTarget,
              onClose: handleMenuClose,
              isTopLevel: true,
            });
          }}
        >
          {' '}
          Map{' '}
        </Typography>
      </div>
      <div className={styles['map-title']}>
        <Typography variant="title">Anglicans Down Under</Typography>
      </div>
      <div className={styles['undo-redo']}>
        <Undo fontSize="medium" />
        <Redo fontSize="medium" />
      </div>
      {openMenu ? <EditorMenu {...openMenu} /> : <></>}
      <ImportModal
        open={openImport}
        onClose={() => setOpenImport(false)}
        onConfirm={onImportConfirm}
        properties={selectedOptions}
      />
      <ChoroplethModal
        open={openChoropleth}
        onClose={() => setOpenImport(false)}
        onConfirm={onChoroplethConfirm}
        properties={selectedOptions}
      />
      <MultiMapLabelModal
        open={openMapLabelModal}
        onClose={() => setOpenMapLabelModal(false)}
        onConfirm={onMultiMapConfirm}
        properties={selectedOptions}
      />
    </div>
  );
}
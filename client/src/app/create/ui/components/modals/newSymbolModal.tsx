import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import style from './LabelSelector.module.scss';
interface NewSymbolModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (svgFile: File | null, preview: string | null) => void;
}

const NewSymbolModal: React.FC<NewSymbolModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('');
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleConfirm = () => {
    onConfirm(svgFile, preview);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && file.type === 'image/svg+xml') {
      setSvgFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Create New Symbol"
    >
      <Box className={style.whiteBg}>
        {' '}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
            marginBottom: '20px',
          }}
        >
          <Typography
            noWrap
            style={{ marginRight: '10px', flex: '0 0 auto', minWidth: '100px' }}
          >
            Dot Size
          </Typography>

          <TextField
            value={name}
            onChange={e => setName(e.target.value)}
            className={style.textField}
            margin="normal"
          />
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <label htmlFor="upload-button">
            <input
              accept=".svg"
              style={{ display: 'none' }}
              id="upload-button"
              type="file"
              onChange={handleFileChange}
            />
            <Button variant="contained" component="span">
              Upload SVG
            </Button>
          </label>
          {preview && (
            <Box>
              <Typography>Preview:</Typography>
              <img
                src={preview}
                alt="SVG Preview"
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </GeneralizedDialog>
  );
};

export default NewSymbolModal;

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';

type Props = {
  /** Sending is wired up in SPEC Phase 6; without it the send button stays disabled. */
  onSend?: (text: string) => void;
};

export function Composer({ onSend }: Props) {
  const [text, setText] = useState('');
  const canSend = Boolean(onSend) && text.trim().length > 0;

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    onSend?.(text.trim());
    setText('');
  };

  // Enter sends, Shift+Enter adds a new line
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 820, mx: 'auto', px: 2, pb: 1.5 }}>
      <Paper
        component="form"
        variant="outlined"
        onSubmit={submit}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          p: 1,
          pl: 2.5,
          borderRadius: 7,
          '&:focus-within': { borderColor: 'primary.main' },
        }}
      >
        <InputBase
          multiline
          maxRows={8}
          autoFocus
          placeholder="Ask anything"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          inputProps={{ 'aria-label': 'Message' }}
          sx={{ flex: 1, py: 1 }}
        />
        <Tooltip title="Send">
          <span>
            <IconButton
              type="submit"
              aria-label="Send"
              disabled={!canSend}
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
              }}
            >
              <ArrowUpwardRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Paper>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ textAlign: 'center', mt: 1 }}>
        AI can make mistakes. Check important info.
      </Typography>
    </Box>
  );
}

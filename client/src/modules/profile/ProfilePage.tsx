
import {Avatar, Box, Button, Paper, Stack, Typography} from "@mui/material";
import {useAuth} from "../auth/useAuth";

export default function ProfilePage(){
  const { user, logout } = useAuth();
  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper sx={{p:3, width: 520}}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar>{user?.name?.[0] || 'U'}</Avatar>
          <Box>
            <Typography variant="h6">{user?.name || 'User'}</Typography>
            <Typography color="text.secondary">{user?.email}</Typography>
          </Box>
        </Stack>
        <Box mt={2}>
          <Button variant="outlined" onClick={logout}>Logout</Button>
        </Box>
      </Paper>
    </Box>
  )
}

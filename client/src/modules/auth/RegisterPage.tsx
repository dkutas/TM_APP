
import {Box, Button, Paper, Stack, TextField, Typography} from "@mui/material";

export default function RegisterPage(){
  return (
    <Box display="flex" justifyContent="center" mt={6}>
      <Paper sx={{p:3, width: 420}}>
        <Typography variant="h5" gutterBottom>Register</Typography>
        <Stack spacing={2}>
          <TextField label="Name"/>
          <TextField label="Email"/>
          <TextField label="Password" type="password"/>
          <Button variant="contained">Create account</Button>
        </Stack>
      </Paper>
    </Box>
  )
}

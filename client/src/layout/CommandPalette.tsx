import {Dialog, DialogContent, DialogTitle, List, ListItemButton, ListItemText, TextField} from '@mui/material'
import {useEffect, useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'

type Item = { label: string; to: string }
const staticItems: Item[] = [
    {label: 'Go to Dashboard', to: '/dashboard'},
    {label: 'Go to Projects', to: '/projects'},
    {label: 'Go to Issues (PROJ)', to: '/projects/1'},
    {label: 'Open Board (PROJ)', to: '/projects/1/board'}
]
export default function CommandPalette({open = false, onClose}: { open: boolean; onClose: () => void }) {
    const [q, setQ] = useState('')
    const navigate = useNavigate()
    const items = useMemo(() => staticItems.filter(i => i.label.toLowerCase().includes(q.toLowerCase())), [q])
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                onClose()
            }
        }

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Command Palette (⌘K)</DialogTitle>
            <DialogContent>
                <TextField fullWidth placeholder="Type a command…" value={q} onChange={(e) => setQ(e.target.value)}
                           sx={{mb: 1}}/>
                <List>
                    {items.map(it => (
                        <ListItemButton key={it.to} onClick={() => {
                            navigate(it.to);
                            onClose()
                        }}>
                            <ListItemText primary={it.label}/>
                        </ListItemButton>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    )
}

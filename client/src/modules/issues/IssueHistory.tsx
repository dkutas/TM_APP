import {Box, Button, Card, CardContent, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import type {Issue, IssuePriority, NormalizedFieldValue, NormalizedHistoryRecord, User} from "../../lib/types.ts";
import {capitalizeFirstLetter} from "../../common/utils.ts";
import {api} from "../../lib/apiClient.ts";
import {useParams} from "react-router-dom";

export const IssueHistory = ({fields}: { fields: Issue["fields"] }) => {
    const [historyEntries, setHistoryEntries] = useState<NormalizedHistoryRecord[]>([]);
    const [showThreeHistory, setShowThreeHistory] = useState(true);

    const {issueId} = useParams()

    useEffect(() => {
        api.get<Issue["history"]>(`/change-log/issue/${issueId}`).then(async (response) => {
            const historyEntries: NormalizedHistoryRecord[] = [];
            for (const hLog of response.data) {
                const user = await api.get<User>(`/user/${hLog.authorId}`).then((res) => res.data.name).catch(() => hLog.authorId);
                const createdAt = hLog.createdAt;
                const items: NormalizedHistoryRecord["items"] = []
                for (const item of hLog.items) {
                    if (item.fieldKey.toLowerCase().startsWith("custom.")) {
                        const fieldDef = fields.find((field) => field.key === item.fieldKey)
                        if (fieldDef) {
                            const label = fieldDef.name || fieldDef.key || "Custom field";
                            let fromValue: NormalizedFieldValue['value'] = item.fromDisplay;
                            let toValue: NormalizedFieldValue['value'] = item.toDisplay;

                            if (fieldDef.dataType === "OPTION" && fieldDef.options) {
                                fromValue = fieldDef.options.find(op => op.id === JSON.parse(item.fromDisplay as string)?.optionId)?.value || item.fromDisplay;
                                toValue = fieldDef.options.find(op => op.id === JSON.parse(item.toDisplay as string)?.optionId)?.value || item.toDisplay;
                            } else if (fieldDef.dataType === "MULTI_OPTION" && fieldDef.options) {
                                const parsedFrom = JSON.parse(item.fromDisplay as string);
                                const parsedTo = JSON.parse(item.toDisplay as string);
                                fromValue = fieldDef.options.filter(op => parsedFrom?.optionIds.includes(op.id)).map(op => op.value).join(", ") || "Empty";
                                toValue = fieldDef.options.filter(op => parsedTo?.optionIds.includes(op.id)).map(op => op.value).join(", ") || "Empty";
                            } else if (fieldDef.dataType === "USER") {
                                if (item.fromDisplay) {
                                    const userId = JSON.parse(item.fromDisplay as string)?.userId;
                                    if (userId) {
                                        fromValue = await api.get<User>(`/user/${userId}`).then((res) => res.data.name).catch(() => "Unassigned");
                                    } else {
                                        fromValue = "Unassigned"
                                    }

                                }
                                if (item.toDisplay) {
                                    const userId = JSON.parse(item.toDisplay as string)?.userId;
                                    if (userId) {
                                        toValue = await api.get<User>(`/user/${userId}`).then((res) => res.data.name).catch(() => "Unassigned");
                                    } else {
                                        fromValue = "Unassigned"
                                    }
                                }
                            }
                            items.push({fieldLabel: label, value: `${fromValue} -> ${toValue}`});
                        }
                    } else {
                        if (item.fieldKey === "assignee" || item.fieldKey === "reporter") {
                            let fromUser = item.fromDisplay;
                            let toUser = item.toDisplay;
                            if (item.fromDisplay) {
                                const fromUserId = item.fromDisplay;
                                if (fromUserId && fromUserId !== "null") {
                                    fromUser = await api.get<User>(`/user/${fromUserId}`).then((res) => res.data.name).catch(() => item.fromDisplay);
                                } else {
                                    fromUser = "Unassigned"
                                }
                            }
                            if (item.toDisplay) {
                                const toUserId = item.toDisplay;
                                if (toUserId && toUserId !== "null") {
                                    toUser = await api.get<User>(`/user/${toUserId}`).then((res) => res.data.name).catch(() => item.toDisplay);
                                } else {
                                    toUser = "Unassigned"
                                }
                            }
                            items.push({
                                fieldLabel: capitalizeFirstLetter(item.fieldKey),
                                value: `${fromUser || "Unassigned"} -> ${toUser || "Unassigned"}`
                            });
                        } else if (item.fieldKey === "priority") {
                            let fromPriority = item.fromDisplay;
                            let toPriority = item.toDisplay;
                            if (item.fromDisplay) {
                                const fromPriorityId = item.fromDisplay;
                                fromPriority = await api.get<IssuePriority>(`/priority/${fromPriorityId}`).then((res) => res.data.name).catch(() => item.fromDisplay);
                            }
                            if (item.toDisplay) {
                                const toPriorityId = item.toDisplay;
                                toPriority = await api.get<IssuePriority>(`/priority/${toPriorityId}`).then((res) => res.data.name).catch(() => item.toDisplay);
                            }
                            items.push({
                                fieldLabel: capitalizeFirstLetter(item.fieldKey),
                                value: `${fromPriority || "—"} -> ${toPriority || "—"}`
                            });
                        } else if (item.fieldKey === "status") {
                            console.log(item)
                        } else {
                            items.push({
                                fieldLabel: item.fieldKey,
                                value: `${item.fromDisplay || "—"} -> ${item.toDisplay || "—"}`
                            });
                        }
                    }
                }
                historyEntries.push({id: hLog.id, actorName: user, createdAt, items})
            }
            setHistoryEntries(historyEntries);
        }).catch((error) => {
            console.error("Error fetching issue history:", error);
        });
    }, [fields, issueId]);

    return (
        <>{
            historyEntries.length > 0 ?
                historyEntries.filter((_, i) => {
                    if (showThreeHistory) {
                        return i < 3
                    } else return true
                }).map(log => (
                    <Stack key={`stack-${log.id}`}>
                        <Card key={`card-${log.id}`} variant="outlined" sx={{mb: 1}}>
                            <CardContent key={`content-${log.id}`}>
                                <Typography variant="subtitle1"
                                            fontWeight={600}>{log.actorName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {new Date(log.createdAt).toLocaleString()}
                                </Typography>
                                {log.items.map(item => {
                                    return (
                                        <Box key={`field-${item.fieldLabel}`} sx={{my: 0.5}}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={600}>{capitalizeFirstLetter(item.fieldLabel)}</Typography>
                                            <Typography variant="body1">
                                                {item.value}
                                            </Typography>
                                        </Box>

                                    )
                                })}
                            </CardContent>
                        </Card>
                    </Stack>))
                : <Typography>No history records found.</Typography>
        }

            {historyEntries.length > 3 ?
                <Button
                    fullWidth
                    onClick={() => setShowThreeHistory((curr) => !curr)}>{showThreeHistory ? "Show all History" : "Hide all History"}</Button> : null}</>
    );
};
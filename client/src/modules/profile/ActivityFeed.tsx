import {useEffect, useState} from "react";
import type {ChangeLogHistory} from "../../lib/types.ts";
import {api} from "../../lib/apiClient.ts";

export const ActivityFeed = () => {
    const [changeLogs, setChangeLogs] = useState<ChangeLogHistory[]>([]);

    useEffect(() => {
        api.get<ChangeLogHistory[]>("change-log/user").then(res => setChangeLogs(res.data));
    })


    return (
        <></>
    );
};
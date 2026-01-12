const edit = true;

import React from "react";
import { observer } from "mobx-react";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import RestartAltOutlined from "@mui/icons-material/RestartAltOutlined";

const ListEmptyTrigger = observer(({ hasPath, component, size }) => {
    const store = component?.getStore?.();
    const loading = store?.isAppLoading();

    if (loading || size > 0) return null;

    const handleRetry = async () => {
        if (store && typeof store.fetch === "function") {
            await store.fetch(component);
        }
    };

    function renderRetryButton() {
        if (hasPath && store) {
            return <Chip onClick={handleRetry} icon={<RestartAltOutlined />} label="重試" color="primary" variant="outlined" className="BaseListEmptyRetryButton" />;
        }
        return null;
    }

    const emptyMessage = store?.getMessageOfListIsEmpty?.() || "暫無資料";

    return (
        <div className="BaseListEmptyDiv">
            <Typography className="BaseListEmptyTypography">{emptyMessage}</Typography>
            {renderRetryButton()}
        </div>
    );
});

export default ListEmptyTrigger;

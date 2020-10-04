/** @jsx jsx */

import React from "react";
import { jsx } from "@emotion/core";
import { Button, Card, notification, Select } from "antd";
import client from "./client";
import { MAX_PLAYERS, MIN_PLAYERS, SCYTHE_BIDDER } from "./constants";

export default function CreateRoom({ onCreate }: { onCreate: () => void }) {
  const [numPlayers, setNumPlayers] = React.useState(2);

  const onClick = React.useCallback(async () => {
    const numPlayersNum = Number(numPlayers);
    if (
      !numPlayersNum ||
      numPlayersNum < MIN_PLAYERS ||
      numPlayersNum > MAX_PLAYERS
    ) {
      return;
    }
    try {
      await client.createMatch(SCYTHE_BIDDER, {
        numPlayers: numPlayersNum,
      });
      onCreate();
    } catch (e) {
      notification.error({ message: String(e) });
    }
  }, [numPlayers, onCreate]);

  return (
    <Card
      css={{ marginTop: 24 }}
      title={
        <div css={{ display: "flex", justifyContent: "space-between" }}>
          <div>Create a room</div>
          {/* <Switch css={{ marginLeft: 12 }} /> */}
        </div>
      }
    >
      <div>
        <div css={{ display: "flex" }}>
          <Select<number>
            value={numPlayers}
            onChange={(value) => {
              setNumPlayers(value);
            }}
            placeholder="# of players"
            style={{ width: 100 }}
          >
            {Array(MAX_PLAYERS + 1 - MIN_PLAYERS)
              .fill(null)
              .map((_, idx) => (
                <Select.Option value={MIN_PLAYERS + idx} key={idx}>
                  {MIN_PLAYERS + idx} players
                </Select.Option>
              ))}
          </Select>
          <Button onClick={onClick} css={{ marginLeft: 12 }} type="primary">
            Create
          </Button>
        </div>
      </div>
    </Card>
  );
}

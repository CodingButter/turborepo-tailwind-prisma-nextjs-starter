import React from "react"
import { ITIRCClientConfig }  from "../lib/TIRCClient"
import { TIRCClientProvider } from './TIRCClientProvider';
import {EmoteProvider} from './EmoteProvider';

export const TIRCProvider: React.FC<{
    config: ITIRCClientConfig
    children: React.ReactNode
  }> = ({ config, children, }) => {
    return (
        <TIRCClientProvider config={config}>
            <EmoteProvider>{children}</EmoteProvider>
        </TIRCClientProvider>
    )
}
import { fetchDadJoke, relays, sk } from "./helpers";
import {
    Client,
    Filter,
    Timestamp,
    initLogger,
	NostrSigner,
	Keys,
	Tag,
	loadWasmAsync,
    LogLevel,
    EventBuilder,
    Event,
    EventId,
    Metadata,
} from "@rust-nostr/nostr-sdk";
async function run() {
    if (!sk && !relays.length) {
        throw new Error("sk not found")
    }
    try {
        await loadWasmAsync();
        initLogger(LogLevel.info());
        const keys = Keys.parse(sk);
        console.log(">>> Public Key: ", keys.publicKey.toBech32());
        const signer = NostrSigner.keys(keys);
        const client = new Client(signer)
        await client.addRelays(relays)
        await client.connect()
        const filter = new Filter()
            .pubkey(keys.publicKey)
            .kinds( new Float64Array([1]))
            .since(Timestamp.now());
        console.log('filter', filter.asJson());
        await client.subscribe([filter])
    
        const handle = {
            // Handle event
            handleEvent: async (relayUrl: string, subscriptionId: string, event: Event) => {
                if (event.kind == 1) {
                    try {
                        if (event.author.toHex() != keys.publicKey.toHex()){
                            let joke = await fetchDadJoke();
                            let rootId = event.tags.find((tag: Tag) => tag.asVec().pop() == 'root')?.asVec();
                            let rootEvent: Event[] | undefined = rootId?.length ? await client.getEventsOf([new Filter().id(EventId.fromHex(rootId[1]))]) : undefined;
                            let ev = EventBuilder.textNoteReply(joke, event, rootEvent?.length ? rootEvent[0] : undefined, relayUrl).toEvent(keys);
                            await client.sendEvent(ev);
                            console.log(ev.content);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            },
            handleMsg: async (relayUrl: string, message: any) => {
                // console.log(message.asJson());
            }
        };

        client.handleNotifications(handle as any);
    } catch (error) {
        console.error(error)
    }
}
run();
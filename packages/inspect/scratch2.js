import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { server } from './src/ui/mcp.js';

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

async function run() {
    await server.connect(serverTransport);
    
    const client = new Client(
        { name: 'test-client', version: '1.0.0' },
        { capabilities: {} }
    );
    await client.connect(clientTransport);
    
    const tools = await client.listTools();
    console.log("Tools:", tools);
    
    const result = await client.callTool({
        name: 'inspect_architecture',
        arguments: { dir: '../ui-next' } // wait, this might be relative to process.cwd()
    });
    console.log("Tool Result:", result);
}
run().catch(console.error);

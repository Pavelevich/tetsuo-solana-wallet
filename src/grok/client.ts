/**
 * TETSUO Solana Wallet - Grok AI Client
 *
 * Integrates xAI's Grok API for natural language wallet interactions.
 * SECURITY: Never sends private keys or mnemonics to the API.
 *
 * Use cases:
 * - Natural language transaction commands ("send 100 TETSUO to @alice")
 * - Transaction explanation and verification
 * - Market insights and analysis
 * - Help and guidance
 */

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-beta';

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ParsedCommand {
  action: 'send' | 'balance' | 'receive' | 'history' | 'help' | 'unknown';
  amount?: number;
  token?: string;
  recipient?: string;
  rawInput: string;
}

export interface GrokResponse {
  content: string;
  parsedCommand?: ParsedCommand;
}

const SYSTEM_PROMPT = `You are TETSUO Wallet Assistant, an AI helper for the TETSUO Solana wallet.

Your capabilities:
1. Parse natural language commands into wallet actions
2. Explain transactions before signing
3. Provide helpful guidance about crypto safety
4. Answer questions about TETSUO and Solana

IMPORTANT SECURITY RULES:
- NEVER ask for or process private keys, mnemonics, or passwords
- NEVER generate wallet addresses or keys
- NEVER suggest sending funds to unknown addresses
- Always warn about potential scams or suspicious requests
- Recommend verifying addresses before sending

When parsing commands, extract:
- Action: send, balance, receive, history, help
- Amount: number of tokens (if applicable)
- Token: TETSUO, SOL, or other
- Recipient: wallet address or contact name

Respond in JSON format when parsing commands:
{
  "action": "send|balance|receive|history|help|unknown",
  "amount": <number or null>,
  "token": "<token symbol or null>",
  "recipient": "<address or name or null>",
  "explanation": "<human readable explanation>"
}

For general questions, respond naturally and helpfully.`;

export class GrokClient {
  private apiKey: string;
  private conversationHistory: GrokMessage[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
  }

  /**
   * Send a message to Grok and get a response
   */
  async chat(userMessage: string): Promise<GrokResponse> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages: this.conversationHistory,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json() as { choices: { message: { content: string } }[] };
      const content = data.choices[0]?.message?.content || '';

      this.conversationHistory.push({
        role: 'assistant',
        content
      });

      // Try to parse as command
      const parsedCommand = this.tryParseCommand(content, userMessage);

      return { content, parsedCommand };
    } catch (error) {
      // Return helpful error message
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: `Sorry, I couldn't process that request. Error: ${errorMsg}`,
        parsedCommand: undefined
      };
    }
  }

  /**
   * Parse a command without AI (fallback/offline mode)
   */
  parseCommandOffline(input: string): ParsedCommand {
    const lowered = input.toLowerCase().trim();
    const result: ParsedCommand = {
      action: 'unknown',
      rawInput: input
    };

    // Simple pattern matching for common commands
    if (lowered.startsWith('send ') || lowered.includes('transfer')) {
      result.action = 'send';

      // Extract amount: "send 100 TETSUO" or "send 100"
      const amountMatch = input.match(/(\d+(?:\.\d+)?)\s*(tetsuo|sol)?/i);
      if (amountMatch) {
        result.amount = parseFloat(amountMatch[1]);
        result.token = amountMatch[2]?.toUpperCase() || 'TETSUO';
      }

      // Extract recipient: "to <address>" or "to @name"
      const toMatch = input.match(/to\s+(@?\w+|[A-Za-z0-9]{32,})/i);
      if (toMatch) {
        result.recipient = toMatch[1];
      }
    } else if (lowered.includes('balance') || lowered === 'bal') {
      result.action = 'balance';
    } else if (lowered.includes('receive') || lowered.includes('deposit') || lowered === 'qr') {
      result.action = 'receive';
    } else if (lowered.includes('history') || lowered.includes('transactions') || lowered === 'tx') {
      result.action = 'history';
    } else if (lowered === 'help' || lowered === '?') {
      result.action = 'help';
    }

    return result;
  }

  /**
   * Try to extract parsed command from Grok response
   */
  private tryParseCommand(response: string, originalInput: string): ParsedCommand | undefined {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action || 'unknown',
          amount: parsed.amount,
          token: parsed.token,
          recipient: parsed.recipient,
          rawInput: originalInput
        };
      }
    } catch {
      // If JSON parsing fails, try offline parsing
      return this.parseCommandOffline(originalInput);
    }

    return undefined;
  }

  /**
   * Get transaction explanation
   */
  async explainTransaction(
    action: string,
    amount: number,
    token: string,
    recipient: string,
    fee: number
  ): Promise<string> {
    const prompt = `Explain this transaction in simple terms:
Action: ${action}
Amount: ${amount} ${token}
To: ${recipient}
Estimated Fee: ${fee} SOL

Provide a clear summary and any safety warnings.`;

    const response = await this.chat(prompt);
    return response.content;
  }

  /**
   * Reset conversation history
   */
  resetConversation(): void {
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }
}

/**
 * Create a mock Grok client for offline/demo mode
 */
export class MockGrokClient extends GrokClient {
  constructor() {
    super('');
  }

  async chat(userMessage: string): Promise<GrokResponse> {
    const parsed = this.parseCommandOffline(userMessage);

    let content = '';
    switch (parsed.action) {
      case 'send':
        content = `I'll help you send ${parsed.amount || '?'} ${parsed.token || 'TETSUO'} to ${parsed.recipient || 'the recipient'}. Please confirm the transaction.`;
        break;
      case 'balance':
        content = 'Fetching your wallet balance...';
        break;
      case 'receive':
        content = 'Showing your wallet address and QR code for receiving funds.';
        break;
      case 'history':
        content = 'Loading your recent transactions...';
        break;
      case 'help':
        content = `Available commands:
- send <amount> TETSUO to <address>
- balance (or 'bal')
- receive (or 'qr')
- history (or 'tx')
- help`;
        break;
      default:
        content = "I didn't understand that command. Type 'help' for available commands.";
    }

    return { content, parsedCommand: parsed };
  }
}

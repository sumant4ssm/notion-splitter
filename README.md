# Notion Page Splitter

Split large Notion pages into smaller ones based on H1 headers. Perfect for breaking down long documents into more manageable pieces.

## Features

- Preview content before splitting
- Split pages based on H1 headers
- No content deletion from source page
- Verify content before manual cleanup
- Support for rich text formatting
- Table support
- Collapsible content preview

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/notion-splitter.git
cd notion-splitter
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
NOTION_API_KEY=your_notion_integration_token
```

4. Start the server:
```bash
npm start
```

5. Open http://localhost:3000 in your browser

## Usage

1. Get your Notion integration token:
   - Go to https://www.notion.so/my-integrations
   - Create a new integration
   - Copy the token

2. Get your page ID:
   - Open your Notion page
   - Copy the ID from the URL (after the workspace name and before the question mark)
   - Example: from `https://notion.so/workspace/17ed0c185bdd808c9367e2b2dae32668`, copy `17ed0c185bdd808c9367e2b2dae32668`

3. Using the tool:
   - Enter your page ID
   - Click "Analyze Page Structure"
   - Preview content for each section
   - Click "Create Page" for sections you want to split out
   - Verify the new pages
   - Manually delete content from the source page once verified

## Development

For development with auto-reload:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security Note

Never share your Notion integration token. Keep it secure and use environment variables.
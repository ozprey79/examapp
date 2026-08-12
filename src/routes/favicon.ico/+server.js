const FAVICON = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
  >
    <rect
      width="32"
      height="32"
      rx="8"
      fill="#111413"
    />
    <circle
      cx="16"
      cy="16"
      r="10"
      fill="#d4af37"
    />
    <circle
      cx="19"
      cy="13"
      r="8"
      fill="#2a9d8f"
      fill-opacity=".88"
    />
  </svg>
`;


export function GET() {
  return new Response(
    FAVICON,
    {
      headers: {
        'cache-control':
          'public, max-age=604800, immutable',

        'content-type':
          'image/svg+xml; charset=utf-8'
      }
    }
  );
}

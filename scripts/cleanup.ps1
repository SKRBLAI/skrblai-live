$files = @(
    "app\services\page.tsx",
    "app\pricing\page.tsx",
    "app\features\page.tsx",
    "app\book-publishing\page.tsx",
    "app\branding\page.tsx",
    "app\auth\page.tsx",
    "app\about\page.tsx"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    $content = $content -replace "import PercyProvider from .*?;`n", ""
    $content = $content -replace "<PercyProvider>", ""
    $content = $content -replace "</PercyProvider>", ""
    Set-Content $file $content
}

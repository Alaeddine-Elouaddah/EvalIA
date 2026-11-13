$body = Get-Content 'test_exam.json' -Raw
$login = Invoke-RestMethod -Uri 'http://127.0.0.1:8080/evalia/api/auth/register' -Method Post -Body '{"name":"Prof Alae","email":"alae.prof4@evalia.ma","password":"password123","role":"TEACHER"}' -ContentType 'application/json'
$headers = @{ "Authorization" = ("Bearer " + $login.token) }
$res = Invoke-RestMethod -Uri 'http://127.0.0.1:8080/evalia/api/exams' -Method Post -Body $body -ContentType 'application/json' -Headers $headers
$res | ConvertTo-Json -Depth 6

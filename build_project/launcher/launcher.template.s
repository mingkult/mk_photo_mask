    .section .text
    .globl launcher_entry
launcher_entry:
    andq $-16, %rsp
    subq $128, %rsp

    # GetModuleFileNameW(NULL, path_buffer, 32767)
    xorq %rcx, %rcx
    leaq path_buffer(%rip), %rdx
    movl $32767, %r8d
    call *__imp_GetModuleFileNameW(%rip)
    testl %eax, %eax
    jz launch_failed

    # Make the single EXE path available to the PowerShell bootstrapper.
    leaq env_name(%rip), %rcx
    leaq path_buffer(%rip), %rdx
    call *__imp_SetEnvironmentVariableW(%rip)
    testl %eax, %eax
    jz launch_failed

    # Convert the ASCII PowerShell prefix into UTF-16.
    leaq command_line(%rip), %rdi
    leaq command_prefix(%rip), %rsi
copy_prefix:
    movzbl (%rsi), %eax
    incq %rsi
    testb %al, %al
    jz copy_suffix_start
    movw %ax, (%rdi)
    addq $2, %rdi
    jmp copy_prefix

# Finish the PowerShell command line.
copy_suffix_start:
    leaq command_suffix(%rip), %rsi
copy_suffix:
    movzbl (%rsi), %eax
    incq %rsi
    movw %ax, (%rdi)
    addq $2, %rdi
    testb %al, %al
    jnz copy_suffix

    # STARTUPINFOW.cb = sizeof(STARTUPINFOW)
    movl $104, startup_info(%rip)

    # CreateProcessW(NULL, command_line, NULL, NULL, FALSE, 0,
    #                NULL, NULL, &startup_info, &process_info)
    xorq %rcx, %rcx
    leaq command_line(%rip), %rdx
    xorq %r8, %r8
    xorq %r9, %r9
    movq $0, 32(%rsp)
    movq $0, 40(%rsp)
    movq $0, 48(%rsp)
    movq $0, 56(%rsp)
    leaq startup_info(%rip), %rax
    movq %rax, 64(%rsp)
    leaq process_info(%rip), %rax
    movq %rax, 72(%rsp)
    call *__imp_CreateProcessW(%rip)
    testl %eax, %eax
    jz launch_failed

    xorl %ecx, %ecx
    call *__imp_ExitProcess(%rip)

launch_failed:
    xorq %rcx, %rcx
    leaq error_text(%rip), %rdx
    leaq caption_text(%rip), %r8
    movl $0x10, %r9d
    call *__imp_MessageBoxW(%rip)
    movl $1, %ecx
    call *__imp_ExitProcess(%rip)

    .section .data
command_prefix:
    .asciz "powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command \"& {$ErrorActionPreference='Stop';try{$self=$env:PHOTO_PRIVACY_EXE;$b=[IO.File]::ReadAllBytes($self);$pe=[BitConverter]::ToInt32($b,60);$n=[BitConverter]::ToUInt16($b,$pe+6);$os=[BitConverter]::ToUInt16($b,$pe+20);$sh=$pe+24+$os;$ptr=-1;$size=0;for($i=0;$i -lt $n;$i++){$o=$sh+40*$i;$name=[Text.Encoding]::ASCII.GetString($b,$o,8).Trim([char]0);if($name -eq '.payload'){$size=[BitConverter]::ToUInt32($b,$o+8);$ptr=[BitConverter]::ToUInt32($b,$o+20);break}};if($ptr -lt 0){throw 'Embedded payload not found'};$base=Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'PhotoPrivacyTool';$dir=Join-Path $base 'v@@VERSION@@-@@HASH12@@';$ready=Join-Path $dir '.ready';if(!(Test-Path -LiteralPath $ready)){[IO.Directory]::CreateDirectory($base)|Out-Null;$tmp=Join-Path $base 'payload-v@@VERSION@@.zip';$z=New-Object byte[] $size;[Array]::Copy($b,$ptr,$z,0,$size);[IO.File]::WriteAllBytes($tmp,$z);if(Test-Path -LiteralPath $dir){Remove-Item -LiteralPath $dir -Recurse -Force};Add-Type -AssemblyName System.IO.Compression.FileSystem;[IO.Compression.ZipFile]::ExtractToDirectory($tmp,$dir);[IO.File]::WriteAllText($ready,'ok');Remove-Item -LiteralPath $tmp -Force};& (Join-Path $dir 'server.ps1')}catch{Write-Host ('Launch failed: '+$_.Exception.Message) -ForegroundColor Red;Read-Host 'Press Enter to close'}}\""
command_suffix:
    .asciz ""

    .align 2
caption_text:
    .short 0x7167,0x7247,0x96B1,0x79C1,0x906E,0x853D,0x5DE5,0x5177,0
error_text:
    .short 0x7121,0x6CD5,0x555F,0x52D5,0x0020,0x0073,0x0065,0x0072,0x0076,0x0065,0x0072,0x002E,0x0070,0x0073,0x0031,0x3002,0
env_name:
    .short 0x0050,0x0048,0x004F,0x0054,0x004F,0x005F,0x0050,0x0052,0x0049,0x0056,0x0041,0x0043,0x0059,0x005F,0x0045,0x0058,0x0045,0

    .section .bss
    .align 16
path_buffer:
    .space 65536
command_line:
    .space 66000
startup_info:
    .space 104
process_info:
    .space 24

    # Import descriptors.
    .section .idata$2,"a"
    .align 4
    .long kernel32_ilt - 0x140000000
    .long 0
    .long 0
    .long kernel32_name - 0x140000000
    .long kernel32_iat - 0x140000000
    .long user32_ilt - 0x140000000
    .long 0
    .long 0
    .long user32_name - 0x140000000
    .long user32_iat - 0x140000000

    # Import lookup tables (8-byte PE32+ thunk entries).
    .section .idata$4,"a"
    .align 8
kernel32_ilt:
    .long hint_GetModuleFileNameW - 0x140000000
    .long 0
    .long hint_CreateProcessW - 0x140000000
    .long 0
    .long hint_SetEnvironmentVariableW - 0x140000000
    .long 0
    .long hint_ExitProcess - 0x140000000
    .long 0
    .quad 0
user32_ilt:
    .long hint_MessageBoxW - 0x140000000
    .long 0
    .quad 0

    # Import address tables used by the executable.
    .section .idata$5,"a"
    .align 8
kernel32_iat:
__imp_GetModuleFileNameW:
    .long hint_GetModuleFileNameW - 0x140000000
    .long 0
__imp_CreateProcessW:
    .long hint_CreateProcessW - 0x140000000
    .long 0
__imp_SetEnvironmentVariableW:
    .long hint_SetEnvironmentVariableW - 0x140000000
    .long 0
__imp_ExitProcess:
    .long hint_ExitProcess - 0x140000000
    .long 0
    .quad 0
user32_iat:
__imp_MessageBoxW:
    .long hint_MessageBoxW - 0x140000000
    .long 0
    .quad 0

    .section .idata$6,"a"
    .align 2
hint_GetModuleFileNameW:
    .short 0
    .asciz "GetModuleFileNameW"
    .align 2
hint_CreateProcessW:
    .short 0
    .asciz "CreateProcessW"
    .align 2
hint_SetEnvironmentVariableW:
    .short 0
    .asciz "SetEnvironmentVariableW"
    .align 2
hint_ExitProcess:
    .short 0
    .asciz "ExitProcess"
    .align 2
hint_MessageBoxW:
    .short 0
    .asciz "MessageBoxW"

    .section .idata$7,"a"
kernel32_name:
    .asciz "KERNEL32.dll"
user32_name:
    .asciz "USER32.dll"

    # Windows icon resources: six RT_ICON images and one RT_GROUP_ICON.
    .section .rsrc,"a"
resource_root:
    .long 0,0
    .short 0,0,0,2
    .long 3
    .long 0x80000000 + (icon_type_dir - resource_root)
    .long 14
    .long 0x80000000 + (group_type_dir - resource_root)

icon_type_dir:
    .long 0,0
    .short 0,0,0,6
    .long 1, 0x80000000 + (icon1_lang_dir - resource_root)
    .long 2, 0x80000000 + (icon2_lang_dir - resource_root)
    .long 3, 0x80000000 + (icon3_lang_dir - resource_root)
    .long 4, 0x80000000 + (icon4_lang_dir - resource_root)
    .long 5, 0x80000000 + (icon5_lang_dir - resource_root)
    .long 6, 0x80000000 + (icon6_lang_dir - resource_root)

group_type_dir:
    .long 0,0
    .short 0,0,0,1
    .long 1, 0x80000000 + (group_lang_dir - resource_root)

icon1_lang_dir:
    .long 0,0
    .short 0,0,0,1
    .long 0, icon1_data_entry - resource_root
icon2_lang_dir:
    .long 0,0
    .short 0,0,0,1
    .long 0, icon2_data_entry - resource_root
icon3_lang_dir:
    .long 0,0
    .short 0,0,0,1
    .long 0, icon3_data_entry - resource_root
icon4_lang_dir:
    .long 0,0
    .short 0,0,0,1
    .long 0, icon4_data_entry - resource_root
icon5_lang_dir:
    .long 0,0
    .short 0,0,0,1
    .long 0, icon5_data_entry - resource_root
icon6_lang_dir:
    .long 0,0
    .short 0,0,0,1
    .long 0, icon6_data_entry - resource_root
group_lang_dir:
    .long 0,0
    .short 0,0,0,1
    .long 0, group_data_entry - resource_root

icon1_data_entry:
    .long icon1_data - 0x140000000
    .long 1128,0,0
icon2_data_entry:
    .long icon2_data - 0x140000000
    .long 4264,0,0
icon3_data_entry:
    .long icon3_data - 0x140000000
    .long 9640,0,0
icon4_data_entry:
    .long icon4_data - 0x140000000
    .long 16936,0,0
icon5_data_entry:
    .long icon5_data - 0x140000000
    .long 67624,0,0
icon6_data_entry:
    .long icon6_data - 0x140000000
    .long 97357,0,0
group_data_entry:
    .long group_icon_data - 0x140000000
    .long group_icon_data_end-group_icon_data,0,0

    .align 4
group_icon_data:
    .short 0,1,6
    .byte 16,16,0,0
    .short 1,32
    .long 1128
    .short 1
    .byte 32,32,0,0
    .short 1,32
    .long 4264
    .short 2
    .byte 48,48,0,0
    .short 1,32
    .long 9640
    .short 3
    .byte 64,64,0,0
    .short 1,32
    .long 16936
    .short 4
    .byte 128,128,0,0
    .short 1,32
    .long 67624
    .short 5
    .byte 0,0,0,0
    .short 1,32
    .long 97357
    .short 6
group_icon_data_end:

    .align 4
icon1_data:
    .incbin "icon.ico",102,1128
    .align 4
icon2_data:
    .incbin "icon.ico",1230,4264
    .align 4
icon3_data:
    .incbin "icon.ico",5494,9640
    .align 4
icon4_data:
    .incbin "icon.ico",15134,16936
    .align 4
icon5_data:
    .incbin "icon.ico",32070,67624
    .align 4
icon6_data:
    .incbin "icon.ico",99694,97357

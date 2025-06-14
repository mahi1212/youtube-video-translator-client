"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Languages } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export const languages = [
  { value: "English", label: "English (English)" },
  { value: "Bengali", label: "Bengali (বাংলা)" },
  { value: "Hindi", label: "Hindi (हिन्दी)" },
  { value: "Spanish", label: "Spanish (Español)" },
  { value: "French", label: "French (Français)" },
  { value: "German", label: "German (Deutsch)" },
  { value: "Chinese", label: "Chinese (中文)" },
  { value: "Arabic", label: "Arabic (العربية)" },
  { value: "Japanese", label: "Japanese (日本語)" },
  { value: "Korean", label: "Korean (한국어)" },
  { value: "Portuguese", label: "Portuguese (Português)" },
  { value: "Russian", label: "Russian (Русский)" },
  { value: "Turkish", label: "Turkish (Türkçe)" },
  { value: "Vietnamese", label: "Vietnamese (Tiếng Việt)" },
  { value: "Thai", label: "Thai (ไทย)" },
  { value: "Indonesian", label: "Indonesian (Bahasa Indonesia)" },
  { value: "Malay", label: "Malay (Bahasa Melayu)" },
  { value: "Dutch", label: "Dutch (Nederlands)" },
  { value: "Polish", label: "Polish (Polski)" },
  { value: "Swedish", label: "Swedish (Svenska)" },
  { value: "Norwegian", label: "Norwegian (Norsk)" },
  { value: "Danish", label: "Danish (Dansk)" },
  { value: "Finnish", label: "Finnish (Suomi)" },
  { value: "Greek", label: "Greek (Ελληνικά)" },
  { value: "Hungarian", label: "Hungarian (Magyar)" },
  { value: "Czech", label: "Czech (Čeština)" },
  { value: "Romanian", label: "Romanian (Română)" },
  { value: "Bulgarian", label: "Bulgarian (Български)" },
  { value: "Croatian", label: "Croatian (Hrvatski)" },
  { value: "Serbian", label: "Serbian (Српски)" },
  { value: "Slovak", label: "Slovak (Slovenčina)" },    
  { value: "Estonian", label: "Estonian (Eesti)" },
  { value: "Latvian", label: "Latvian (Latvian)" },
  { value: "Lithuanian", label: "Lithuanian (Lietuvių)" },
  { value: "Maltese", label: "Maltese (Malti)" },
  { value: "Macedonian", label: "Macedonian (Македонски)" },
  { value: "Mongolian", label: "Mongolian (Монгол)" },
  { value: "Persian", label: "Persian (فارسی)" },
  
]   

interface LanguageComboboxProps {
  value: string
  onChange: (value: string) => void
}

export function LanguageCombobox({ value, onChange }: LanguageComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12"
        >
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4" />
            {value
              ? languages.find((language) => language.value === value)?.label
              : "Select a language to translate to"}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search language..." className="h-9" />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {language.label}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 
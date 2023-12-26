# capacitor-flic2

Capacitor plugin for Flic2 lib
Source: https://github.com/Boerrild/capacitor-flic2

## Build

    npm run build

## Install locally build version

    npm install ../capacitor-flic2
    npx cap sync

### Unlinking the Plugin

    npm uninstall capacitor-flic2




# Log

### 2023-12-26
- Oprettet projekt og klargjort
  (se https://capacitorjs.com/docs/plugins/creating-plugins)

      npm init @capacitor/plugin@latest

med følgende input:

    Need to install the following packages: @capacitor/create-plugin@0.10.0, Ok to proceed? 
    -> y
    ✔ What should be the npm package of your plugin?
    -> capacitor-flic2
    ✔ What directory should be used for your plugin?
    -> capacitor-flic2
    ✔ What should be the Package ID for your plugin?
    
        Package IDs are unique identifiers used in apps and plugins. For plugins,
        they're used as a Java namespace. They must be in reverse domain name
        notation, generally representing a domain name that you or your company owns.
    
    -> com.capfire.capacitor.plugins.flic2
    ✔ What should be the class name for your plugin?
    -> Flic2
    ✔ What is the repository URL for your plugin?
    -> https://github.com/Boerrild/capacitor-flic2
    ✔ (optional) Who is the author of this plugin?
    -> Christoffer Boerrild
    ✔ What license should be used for your plugin?
    -› other...
    ? Enter a SPDX license identifier for your plugin.
    -> CC0 1.0 Universal
    ✔ Enter a short description of plugin features.
    -> Capacitor plugin for Flic2 lib
    
    ...
    
    Need to install the following packages:
    @capacitor/create-app@0.2.1
    Ok to proceed? (y) y

Build:

    npm run build

- kopier filer fra https://github.com/50ButtonsEach/fliclib-ios ind i 'flic2lib/ios'

      npm install
      npm run build   

- åben 'ios/Plugin.xcworkspace' fra Finder (IKKE 'Plugin.xcodeproj' !!!)

- (fra Finder) træk 'flic2lib/ios/flic2lib.xcframework' ind i Xcode '/Plugin/General/Frameworks and Libraries' og sæt Embed til 'Embed & Sign'
- (har gentaget det samme for andre steder ...ikke sikker på hvad der hjalp!?)

- Sæt '/Plugin/Build Settings/Apple Clang - Language - Modules/Allow Non-modular includes in Framework Modules' til Yes

- Ret filen 'CapacitorFlic2.podspec' ved at tilføje linjen:

       s.ios.vendored_frameworks = 'flic2lib/ios/flic2lib.xcframework'

- Rettet Flic.swift, Flic2Plugin.m etc. (kopieret fra cs8)



### Git repository
Tilføjet til github:

    git remote add origin git@github.com:Boerrild/capacitor-flic2.git
    git branch -M main
    git push -u origin main


--- 

_(original text on how to install plugin from npm, given it was ever published there)_
## Install

```bash
npm install capacitor-flic2
npx cap sync
```

## API

<docgen-index>

* [`echo(...)`](#echo)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------

</docgen-api>

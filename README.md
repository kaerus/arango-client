ArangoDB client
===============
A client for the ArangoDB nosql database.

Updates
-------
This project has been tranfered to [kaerus-component/arango](https://github.com/kaerus-component/arango).

Migration path
--------------
In you `package.json` change dependency from `"arango-client":"*"` to `"arango":">=0.1.0"`
and in your source files change ```require('arango.client')``` to ```require('arango')```. 


License
=======
```
Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 
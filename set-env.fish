echo Now working on Senior Project
set -g WS (cd (dirname (status -f)); and pwd)
set PATH $WS/bin $PATH

function ws -d "Goto $WS"
    cd $WS
end

function upd-bin
    cp "$WS/data-processor/string-distance/String Distance/DerivedData/String Distance/Build/Products/Release/String Distance" "$WS/bin/string-distance"
end